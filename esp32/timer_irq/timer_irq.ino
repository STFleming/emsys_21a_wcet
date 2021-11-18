
unsigned count;

// our interrupt service routine
void IRAM_ATTR timerISR() {
        count++;
}

hw_timer_t *timer;

void setup() {
        Serial.begin(115200);
        timer = timerBegin(1, 80, true);
        timerAttachInterrupt(timer, &timerISR, true); 
        timerAlarmWrite(timer, 1000000, true);
        timerAlarmEnable(timer);

        count = 0;
}

void loop() {
        delay(500);
        Serial.println(count);
}
