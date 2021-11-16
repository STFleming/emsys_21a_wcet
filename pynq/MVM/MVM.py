# Matrix-vector multiplication

# Used to show the variance in execution time latency on an embedded linux
# device as part of the Swansea emSys course.
# developed for the wonderful PYNQ device from Xilinx

# author: stf

import time
from numpy.random import seed
from numpy.random import rand


# initialisation
res = [0.0 for x in range(15)]
rvec = rand(15)
rmat = rand(15, 15)

while True:
    res = rmat.dot(rvec)
