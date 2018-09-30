#include <LiquidCrystal.h>

#define BOTTON_NEXT 3
#define DIGITAL_LEDAZUL 4
#define DIGITAL_LEDVERDE 5
#define DIGITAL_LEDROJO 6
#define DIGITAL_BUZZER 13

LiquidCrystal lcd(7, 8, 9, 10, 11, 12);

String sNotificacionesCAL;
String sNotificacionesTAS;
String stipoNotificacion;
String sNotificaciones;
String sTituloNotificacion;
String sNotificacionActual;
String inString; 
String sDatosPrefijo;
String sDatosFinal;

int iLargoDatos;
int iPulsadorNext;
int iPulsadorListo;

bool bRefrescarLCD;
bool bPregunta;

void setup() {
  Serial.begin(9600);
  pinMode(BOTTON_NEXT, INPUT);
  pinMode(DIGITAL_LEDVERDE, OUTPUT);
  pinMode(DIGITAL_LEDAZUL, OUTPUT);
  pinMode(DIGITAL_LEDROJO, OUTPUT);
  pinMode(DIGITAL_BUZZER, OUTPUT);
  
  //Valores inciales 
  sNotificacionesCAL = "0";
  sNotificacionesTAS = "0";
  sTituloNotificacion = "";
  
  bRefrescarLCD = true;
  iPulsadorNext = LOW;
  iPulsadorListo = LOW;
  sNotificaciones = "0";
  sTituloNotificacion = "";
  sNotificacionActual = "0";
  ledVERDEAZULROJO(LOW, HIGH, LOW);
  
  lcd.begin(16, 2);
  printLCD("RememberMe!", "By: Lola");
  
  delay(2000);
}
void loop() {
  inString =  Serial.readStringUntil('\n'); 
  sDatosPrefijo = inString.substring(0, 3);
  iLargoDatos = inString.length();
  sDatosFinal = inString.substring(3, iLargoDatos);
  
  if (sDatosPrefijo == "#1#") { sTituloNotificacion = sDatosFinal; }
  if (sDatosPrefijo == "#2#") { stipoNotificacion = sDatosFinal; }
  if (sDatosPrefijo == "#3#") { sNotificacionActual = sDatosFinal; }
  
  if (sDatosPrefijo == "#4#") { sNotificacionesCAL = sDatosFinal; }
  if (sDatosPrefijo == "#5#") { sNotificacionesTAS = sDatosFinal; }
  
  if (sTituloNotificacion !="") { 
    preguntar();
    bRefrescarLCD = true;
  } else {
    if (bRefrescarLCD) { 
      delay(500);
      printLCD("RememberMe!", "CAL:"+sNotificacionesCAL+" TASK:"+sNotificacionesTAS);
      ledVERDEAZULROJO(LOW, HIGH, LOW); 
      bRefrescarLCD = false;
      sTituloNotificacion = "";
    }
  }
}

void preguntar() {
  if (stipoNotificacion == "CALENDARIO") {sNotificaciones =  sNotificacionesCAL;}
  if (stipoNotificacion == "TASK") {sNotificaciones =  sNotificacionesTAS;}
  printLCD(stipoNotificacion+": "+sNotificacionActual+"/"+sNotificaciones, sTituloNotificacion);
  bPregunta = true;
  
  while(bPregunta) {
    sonarBuzzer();
    iPulsadorNext = digitalRead(BOTTON_NEXT);
  
    if (iPulsadorNext == HIGH) {
      ledVERDEAZULROJO(LOW, HIGH, HIGH);
      printLCD(stipoNotificacion+": ","   LOADING...   ");
      salirWhile();
    } 
  } 
}

void salirWhile() {  
  sTituloNotificacion = "";
  bPregunta = false;
  delay(500);
}

void sonarBuzzer() {  
  tone(DIGITAL_BUZZER, 500);
  ledVERDEAZULROJO(HIGH, LOW, HIGH); 
  delay(400);               
  noTone(DIGITAL_BUZZER);
  ledVERDEAZULROJO(LOW, LOW, LOW); 
  delay(400); 
}

void printLCD(String sLinea1, String sLinea2) {  
  lcd.clear();
  lcd.print(sLinea1);
  lcd.setCursor(0, 1);
  lcd.print(sLinea2);
}

void ledVERDEAZULROJO(int iPinVerde, int iPinAzul, int iPinRojo) {  
  digitalWrite(DIGITAL_LEDVERDE, iPinVerde);
  digitalWrite(DIGITAL_LEDAZUL, iPinAzul);
  digitalWrite(DIGITAL_LEDROJO, iPinRojo);
}
