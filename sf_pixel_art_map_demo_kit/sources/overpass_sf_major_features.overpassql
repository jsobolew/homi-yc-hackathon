[out:json][timeout:60];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](37.695,-122.535,37.842,-122.300);
  way["leisure"="park"](37.695,-122.535,37.842,-122.300);
  way["natural"="water"](37.695,-122.535,37.842,-122.300);
  relation["leisure"="park"](37.695,-122.535,37.842,-122.300);
  relation["natural"="water"](37.695,-122.535,37.842,-122.300);
);
out geom;
