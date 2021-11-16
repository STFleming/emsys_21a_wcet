# Matrix-vector multiplication

# Used to show the variance in execution time latency on an embedded linux
# device as part of the Swansea emSys course.
# developed for the wonderful PYNQ device from Xilinx

# author: stf

from pynq.overlays.base import BaseOverlay 
from pynq.lib.arduino import arduino_io
import time
from numpy.random import seed
from numpy.random import rand

base = BaseOverlay('base.bit')
p0 = arduino_io.Arduino_IO(base.iop_arduino.mb_info, 14, 'out')

def pulse_pin(pin):
    pin.write(1)
    pin.write(0)

# initialisation
p0.write(0)
res = [0.0 for x in range(15)]
rvec = rand(15)
rmat = rand(15, 15)

while True:
   pulse_pin(p0)
   res = rmat.dot(rvec)

