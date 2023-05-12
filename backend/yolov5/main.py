from depthai_sdk import OakCamera, ArgsParser
import argparse

# parse arguments
parser = argparse.ArgumentParser()
parser.add_argument("-conf", "--config", help="Trained YOLO json config path", default='model/yolov5trainedweight.json', type=str)
args = ArgsParser.parseArgs(parser)

with OakCamera(args=args) as oak:
    color = oak.create_camera('color')
    nn = oak.create_nn(args['config'], color, nn_type='yolo', spatial=True)
    oak.visualize(nn, fps=6, scale=2/3)
    oak.visualize(nn.out.passthrough, fps=6)
    oak.start(blocking=True)
