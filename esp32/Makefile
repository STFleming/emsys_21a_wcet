PORT=/dev/ttyUSB2
EMSYS_COMP=~/EmSys/arduino-cli compile --fqbn esp32:esp32:tinypico
EMSYS_UPLOAD=~/EmSys/arduino-cli upload --fqbn esp32:esp32:tinypico

.PHONY: ws_sketch_timer timer_irq 

ws_sketch_timer: ws_sketch_timer/ws_sketch_timer.ino
		$(EMSYS_COMP) ws_sketch_timer 
		$(EMSYS_UPLOAD) -p $(PORT) ws_sketch_timer 

timer_irq: timer_irq/timer_irq.ino
		$(EMSYS_COMP) timer_irq 
		$(EMSYS_UPLOAD) -p $(PORT) timer_irq 
