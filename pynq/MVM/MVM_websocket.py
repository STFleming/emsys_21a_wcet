# Matrix-vector multiplication

# Used to show the variance in execution time latency on an embedded linux
# device as part of the Swansea emSys course.
# developed for the wonderful PYNQ device from Xilinx

# author: stf

from time import time
from time import sleep
from numpy.random import seed
from numpy.random import rand
import asyncio
import websockets

# initialisation
res = [0.0 for x in range(125)]
rvec = rand(125)
rmat = rand(125, 125)

# websocket initialisation
async def hello():
    uri = "ws://192.168.0.102:1234"
    async with websockets.connect(uri) as websocket:
        while True:
            t0 = time()
            res = rmat.dot(rvec)
            t1 = time()
            time_sample = "{:.4f}".format((t1 - t0)*1000000.0)
            json_str = "{ \"id\" : \"PYNQ\", \"val\":" + time_sample + "}"
            await websocket.send(json_str)

asyncio.get_event_loop().run_until_complete(hello())

