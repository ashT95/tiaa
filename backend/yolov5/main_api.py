#!/usr/bin/env python3
"""
The code is edited from docs (https://docs.luxonis.com/projects/api/en/latest/samples/Yolo/tiny_yolo/)
We add parsing from JSON files that contain configuration
"""

from pathlib import Path
import sys
import cv2
import depthai as dai
import numpy as np
import time
import math 

# Define blob path/file location
nnPath = str(
    (
        Path(__file__).parent
        / Path("./model/yolov5trainedweight_openvino_2022.1_6shave.blob")
    )
    .resolve()
    .absolute()
)

if len(sys.argv) > 1:
    nnPath = sys.argv[1]

labels = ["hand", "person"]

syncNN = True

# Create pipeline
pipeline = dai.Pipeline()

# Define sources and outputs
camRgb = pipeline.create(dai.node.ColorCamera)
detectionNetwork = pipeline.create(dai.node.YoloSpatialDetectionNetwork)
monoLeft = pipeline.create(dai.node.MonoCamera)
monoRight = pipeline.create(dai.node.MonoCamera)
stereo = pipeline.create(dai.node.StereoDepth)
nnNetworkOut = pipeline.create(dai.node.XLinkOut)

xoutRgb = pipeline.create(dai.node.XLinkOut)
nnOut = pipeline.create(dai.node.XLinkOut)
xoutDepth = pipeline.create(dai.node.XLinkOut)

xoutRgb.setStreamName("rgb")
nnOut.setStreamName("nn")
xoutDepth.setStreamName("depth")
nnNetworkOut.setStreamName("nnNetwork")

# Options: MEDIAN_OFF, KERNEL_3x3, KERNEL_5x5, KERNEL_7x7 (default)
stereo.initialConfig.setMedianFilter(dai.MedianFilter.KERNEL_7x7)
stereo.setLeftRightCheck(True)
stereo.setSubpixel(True)

config = stereo.initialConfig.get()
config.postProcessing.speckleFilter.enable = False
config.postProcessing.speckleFilter.speckleRange = 50
config.postProcessing.temporalFilter.enable = True
config.postProcessing.spatialFilter.enable = True
config.postProcessing.spatialFilter.holeFillingRadius = 2
config.postProcessing.spatialFilter.numIterations = 1
config.postProcessing.decimationFilter.decimationFactor = 1
stereo.initialConfig.set(config)

# Network specific settings
detectionNetwork.setConfidenceThreshold(0.5)
detectionNetwork.setNumClasses(2)
detectionNetwork.setCoordinateSize(4)
detectionNetwork.setAnchors(
    [
        10.0,
        13.0,
        16.0,
        30.0,
        33.0,
        23.0,
        30.0,
        61.0,
        62.0,
        45.0,
        59.0,
        119.0,
        116.0,
        90.0,
        156.0,
        198.0,
        373.0,
        326.0,
    ]
)
detectionNetwork.setAnchorMasks(
    {"side80": [0, 1, 2], "side40": [3, 4, 5], "side20": [6, 7, 8]}
)
detectionNetwork.setIouThreshold(0.5)
detectionNetwork.setBlobPath(nnPath)
detectionNetwork.setNumInferenceThreads(2)
detectionNetwork.input.setBlocking(False)

detectionNetwork.setDepthLowerThreshold(200)
detectionNetwork.setDepthUpperThreshold(30000)

# Properties
camRgb.setPreviewSize(640, 352)
camRgb.setResolution(dai.ColorCameraProperties.SensorResolution.THE_1080_P)
camRgb.setInterleaved(False)
camRgb.setColorOrder(dai.ColorCameraProperties.ColorOrder.BGR)
# camRgb.setImageOrientation(dai.CameraImageOrientation.ROTATE_180_DEG)
camRgb.setFps(6)

monoLeft.setResolution(dai.MonoCameraProperties.SensorResolution.THE_400_P)
monoLeft.setBoardSocket(dai.CameraBoardSocket.LEFT)
monoRight.setResolution(dai.MonoCameraProperties.SensorResolution.THE_400_P)
monoRight.setBoardSocket(dai.CameraBoardSocket.RIGHT)

# Linking
monoLeft.out.link(stereo.left)
monoRight.out.link(stereo.right)

camRgb.preview.link(detectionNetwork.input)
if syncNN:
    detectionNetwork.passthrough.link(xoutRgb.input)
else:
    camRgb.preview.link(xoutRgb.input)

detectionNetwork.out.link(nnOut.input)

stereo.depth.link(detectionNetwork.inputDepth)
detectionNetwork.passthroughDepth.link(xoutDepth.input)
detectionNetwork.outNetwork.link(nnNetworkOut.input)

# setting node configs
# stereo.setDefaultProfilePreset(dai.node.StereoDepth.PresetMode.HIGH_DENSITY)
# Align depth map to the perspective of RGB camera, on which inference is done
stereo.initialConfig.setConfidenceThreshold(255)
stereo.setDepthAlign(dai.CameraBoardSocket.RGB)
stereo.setOutputSize(monoLeft.getResolutionWidth(), monoLeft.getResolutionHeight())

# Connect to device and start pipeline
with dai.Device(pipeline) as device:
    device.setIrLaserDotProjectorBrightness(100) # in mA, 0..1200
    device.setIrFloodLightBrightness(0) # in mA, 0..1500
    # Output queues will be used to get the rgb frames and nn data from the outputs defined above
    previewQueue = device.getOutputQueue(name="rgb", maxSize=4, blocking=False)
    detectionNNQueue = device.getOutputQueue(name="nn", maxSize=4, blocking=False)
    depthQueue = device.getOutputQueue(name="depth", maxSize=4, blocking=False)
    networkQueue = device.getOutputQueue(name="nnNetwork", maxSize=4, blocking=False)

    startTime = time.monotonic()
    counter = 0
    fps = 0
    color = (255, 255, 255)
    printOutputLayersOnce = True

    # def _calc_angle(frame, offset, HFOV):
    #     return math.atan(math.tan(HFOV / 2.0) * offset / (frame.shape[1] / 2.0))

    while True:
        inPreview = previewQueue.get()
        inDet = detectionNNQueue.get()
        depth = depthQueue.get()
        inNN = networkQueue.get()

        # calibData = device.readCalibration()
        # HFOV = np.deg2rad(calibData.getFov(dai.CameraBoardSocket(depth.getInstanceNum())))
        # averaging_method = np.mean

        if printOutputLayersOnce:
            toPrint = 'Output layer names:'
            for ten in inNN.getAllLayerNames():
                toPrint = f'{toPrint} {ten},'
            print(toPrint)
            printOutputLayersOnce = False

        frame = inPreview.getCvFrame()
        depthFrame = depth.getFrame()  # depthFrame values are in millimeters

        depthFrameColor = cv2.normalize(
            depthFrame, None, 255, 0, cv2.NORM_INF, cv2.CV_8UC1
        )
        depthFrameColor = cv2.equalizeHist(depthFrameColor)
        depthFrameColor = cv2.applyColorMap(depthFrameColor, cv2.COLORMAP_HOT)

        counter += 1
        current_time = time.monotonic()
        if (current_time - startTime) > 1:
            fps = counter / (current_time - startTime)
            counter = 0
            startTime = current_time

        detections = inDet.detections

        # def calculate_distance(coords):
        #     return math.sqrt(coords.x ** 2 + coords.y ** 2 + coords.z ** 2)
        # def get_lens_position(dist):
        # # =150-A10*0.0242+0.00000412*A10^2
        #     return int(150 - dist * 0.0242 + 0.00000412 * dist**2)

        # If the frame is available, draw bounding boxes on it and show the frame
        height = frame.shape[0]
        width = frame.shape[1]
        for detection in detections:
            try:
                label = labels[detection.label]
            except:
                label = detection.label
            

            if (label == "hand") :
                roiData = detection.boundingBoxMapping
                roi = roiData.roi
                roi = roi.denormalize(depthFrameColor.shape[1], depthFrameColor.shape[0])
                topLeft = roi.topLeft()
                bottomRight = roi.bottomRight()
                xmin = int(topLeft.x)
                ymin = int(topLeft.y)
                xmax = int(bottomRight.x)
                ymax = int(bottomRight.y)
                cv2.rectangle(depthFrameColor, (xmin, ymin), (xmax, ymax), color, cv2.FONT_HERSHEY_SCRIPT_SIMPLEX)

                # Calculate the average depth in the ROI.
                # depthROI = depthFrame[ymin:ymax, xmin:xmax]
                # inRange = (200 <= depthROI) & (depthROI <= 30000)

                # averageDepth = averaging_method(depthROI[inRange])

                # centroid = { # Get centroid of the ROI
                #     'x': int((xmax + xmin) / 2),
                #     'y': int((ymax + ymin) / 2)
                # }

                # midW = int(depthFrame.shape[1] / 2) # middle of the depth img width
                # midH = int(depthFrame.shape[0] / 2) # middle of the depth img height
                # bb_x_pos = centroid['x'] - midW
                # bb_y_pos = centroid['y'] - midH

                # angle_x = _calc_angle(depthFrame, bb_x_pos, HFOV)
                # angle_y = _calc_angle(depthFrame, bb_y_pos, HFOV)

                # spatials = {
                #     'z': averageDepth,
                #     'x': averageDepth * math.tan(angle_x),
                #     'y': -averageDepth * math.tan(angle_y)
                # }

                # Denormalize bounding box
                x1 = int(detection.xmin * width)
                x2 = int(detection.xmax * width)
                y1 = int(detection.ymin * height)
                y2 = int(detection.ymax * height)

                cv2.putText(frame, str(label), (x1 + 10, y1 + 20), cv2.FONT_HERSHEY_TRIPLEX, 0.5, 255)
                cv2.putText(frame, "{:.2f}".format(detection.confidence*100), (x1 + 10, y1 + 35), cv2.FONT_HERSHEY_TRIPLEX, 0.5, 255)
                cv2.putText(frame, f"X: {int(detection.spatialCoordinates.x)}", (x1 + 10, y1 + 50), cv2.FONT_HERSHEY_TRIPLEX, 0.5, 255)
                cv2.putText(frame, f"Y: {int(detection.spatialCoordinates.y)}" , (x1 + 10, y1 + 65), cv2.FONT_HERSHEY_TRIPLEX, 0.5, 255)
                cv2.putText(frame, f"Z: {int(detection.spatialCoordinates.z)}" , (x1 + 10, y1 + 80), cv2.FONT_HERSHEY_TRIPLEX, 0.5, 255)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, cv2.FONT_HERSHEY_SIMPLEX)


        
                # dist = int(calculate_distance(detection.spatialCoordinates))
                # pos = get_lens_position(dist)
                # print(pos)

            # --------------------------------------SENDING COORDINATES TO ELECTRON MAIN---------------------------------------------------- #
                print(f"HAND:X:{int(detection.spatialCoordinates.x)},Y:{int(detection.spatialCoordinates.y)},Z:{int(detection.spatialCoordinates.z)}")
                sys.stdout.flush()

            # if (label == "person") :
                # print(f"PERSON:X:{int(detection.spatialCoordinates.x)},Y:{int(detection.spatialCoordinates.y)},Z:{int(detection.spatialCoordinates.z)}")
                # sys.stdout.flush()
            # ------------------------------------------------------------------------------------------------------------------------------- #

        cv2.putText(frame, "NN fps: {:.2f}".format(fps), (2, frame.shape[0] - 4), cv2.FONT_HERSHEY_TRIPLEX, 0.4, color)
        # cv2.imshow("depth", depthFrameColor)
        cv2.imshow("rgb", frame)

        if cv2.waitKey(1) == ord("q"):
            break
