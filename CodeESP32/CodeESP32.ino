#include "DHT.h"
#include <WiFi.h>
#include <WiFiClient.h>
#include <FirebaseESP32.h>
#include <ThingSpeak.h>
#include <Wire.h>
#include <BH1750.h>
#include <math.h>
#include <HTTPClient.h>
#include <TimeLib.h>

BH1750 lightMeter;
WiFiClient  client;

FirebaseData fbdo;

//-----Wifi-------
#define WIFI_SSID "IoT Lab"
#define WIFI_PASSWORD "IoT@123456"

//---define pin
#define DHTPIN 19
#define DHTTYPE DHT11 
DHT dht(DHTPIN, DHTTYPE);
int led = 4;
int water = 5;
int fan = 15;
int groundHumidity = 34;

//-----timedelay---
unsigned long currentTime;
unsigned long saveTime = 0;
int timeDelay = 60000; // 60s

//-------id google sheet
String Script_ID = "AKfycbw4BCxoSRnWKDTJQ7a56zesk_dmGB0HGNP__86rzjlCtICeOQWm9SoUfcsLeHIh1CE";

//----thingspeak-----
#define CHANNEL_ID 2053165
#define CHANNEL_API_KEY "3D8Y8XYNQQKEYXJL"

//------Firebase--------
#define DATABASE_URL "https://tt-iot-21acd-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define API_KEY "pj6wWvcIqPMj0TC4HkpWriQXOPJhSKXZSPTj8dCN"


void setup()
{
  Serial.begin(9600);
  pinMode(led,OUTPUT);
  pinMode(water,OUTPUT);
  pinMode(fan,OUTPUT);
  pinMode(groundHumidity, INPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  dht.begin();
  Firebase.begin(DATABASE_URL, API_KEY);
  ThingSpeak.begin(client);

  Wire.begin();
  lightMeter.begin();

  
}

void loop()
{ 
  checkLed();
  checkWater();
  checkFan();

  //----------Intensity----------
  float lux = ceil(lightMeter.readLightLevel());
  
  Firebase.setFloat(fbdo, "/IoT/Intensity", lux);
  Serial.print("Light: ");
  Serial.print(lux);
  Serial.println(" lux");

  //--------DHT11--------
  float hum = dht.readHumidity();
  float temp = dht.readTemperature();
  Firebase.setFloat(fbdo, "/IoT/Temperature", temp);
  Firebase.setFloat(fbdo, "/IoT/Humidity", hum);
  ThingSpeak.writeField(CHANNEL_ID,1,temp,CHANNEL_API_KEY);
  ThingSpeak.writeField(CHANNEL_ID,2,hum,CHANNEL_API_KEY);
  
  Serial.print("Độ ẩm: ");
  Serial.print(hum);
  Serial.print(" %\t");
  Serial.print("Nhiệt độ: ");
  Serial.print(temp);
  Serial.print(" *C ");
  Serial.print("\n");

  //-------GroundHumidity----------
  int analog = analogRead(groundHumidity);
  int phantram = map(analog, 4095, 1710, 0, 100);
  int zero = 0;
  int full = 100;
  int newPhanTram;
  
  if(phantram > 100) {
    ThingSpeak.writeField(CHANNEL_ID,3,full,CHANNEL_API_KEY);
    Firebase.setFloat(fbdo, "/IoT/GroundHumidity", full);
    newPhanTram = 100;
    }
  else if(phantram < 1) {
    ThingSpeak.writeField(CHANNEL_ID,3,zero,CHANNEL_API_KEY);
    Firebase.setFloat(fbdo, "/IoT/GroundHumidity",zero);
    newPhanTram = 0;
    }
  else {
    ThingSpeak.writeField(CHANNEL_ID,3,phantram,CHANNEL_API_KEY);
    Firebase.setFloat(fbdo, "/IoT/GroundHumidity", phantram);
    newPhanTram = phantram;
    }  
  phantram = newPhanTram;
  Serial.print(newPhanTram);
  Serial.print(" %\t");

  //-------send data to gg sheet----
  currentTime = millis();
  if(currentTime - saveTime >= timeDelay){
    saveTime = currentTime;
    HTTPClient http;
    String url="https://script.google.com/macros/s/" + Script_ID + "/exec?NhietDo=" + String(temp) + "&DoAm=" + String(hum) + "&DoAmDat=" + String(newPhanTram) + "&CDAS=" + String(lux);
    http.begin(url);
    int httpCode = http.GET();  
    http.end();
    } 
}

//------get data from firebase and device controller-----
void checkWater(){
  if(Firebase.getInt(fbdo, "/IoT/Water") == true){
    int st = fbdo.to<int>();
    if(st == 1) 
      digitalWrite(water, HIGH);
    else 
      digitalWrite(water, LOW);
    }
}
void checkLed() {
  if(Firebase.getInt(fbdo, "/IoT/Led") == true){
    int st = fbdo.to<int>();
    if(st == 1) 
      digitalWrite(led, HIGH);
    else 
      digitalWrite(led, LOW);
    }
}
void checkFan() {
  if(Firebase.getInt(fbdo, "/IoT/Fan") == true){
    int st = fbdo.to<int>();
    if(st == 1) 
      digitalWrite(fan, HIGH);
    else 
      digitalWrite(fan, LOW);
    }
}
