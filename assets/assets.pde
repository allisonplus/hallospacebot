void setup() {

  size(640,360);

  for (int i = 0; i < 2500; i++) {
    float x = random(width);
    float y = random(height);
    float r = random(50, 255);
    float b = random(50, 155);
    noStroke();
    fill(r, 0, b, 100);
    ellipse(x, y, 12, 12);
  }
  save("output.png");
  exit();
}
