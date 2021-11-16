# Matrix-Vector Multiplication

In this experiment we have a reasonably complex matrix-vector multiplication (random) and we are using this to see the variance in the execution times of the system.

Author: stf

* MVM_pulse.py : Generates a pulse on the GPIO pin to show the execution time on a scope.
* MVM_websocket.py : Sends the number of cycles that the execution took to a webserver for rendering.
* MVM.py : The matrix-vector multiplication (used to generate noise in the systems execution environment and overload the system)
