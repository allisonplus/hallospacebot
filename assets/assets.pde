PImage img;
img = loadImage("upload.jpeg");
image(img, 0, 0);
tint(0, 153, 204, 126);
image(img, 50, 0);
save("output.jpeg");
exit();
