PImage img;
PImage galactic;

void setup() {
  size( 800, 500 );
  img = loadImage("upload.jpeg");
  galactic = loadImage("lightning.jpg");
}

void draw() {
  background(galactic);
  tint(255, 255, 155, 150);
  image(img, 0, 0);
  save("output.jpeg");
  exit();
}
