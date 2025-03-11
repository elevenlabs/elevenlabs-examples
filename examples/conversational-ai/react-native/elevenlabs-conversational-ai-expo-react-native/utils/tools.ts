import * as Battery from "expo-battery";
import * as Brightness from "expo-brightness";

const get_battery_level = async () => {
  const batteryLevel = await Battery.getBatteryLevelAsync();
  console.log("batteryLevel", batteryLevel);
  if (batteryLevel === -1) {
    return "Error: Device does not support retrieving the battery level.";
  }
  return batteryLevel;
};

const change_brightness = ({ brightness }: { brightness: number }) => {
  console.log("change_brightness", brightness);
  Brightness.setSystemBrightnessAsync(brightness);
  return brightness;
};

const flash_screen = () => {
  Brightness.setSystemBrightnessAsync(1);
  setTimeout(() => {
    Brightness.setSystemBrightnessAsync(0);
  }, 200);
  return "Successfully flashed the screen.";
};

const tools = {
  get_battery_level,
  change_brightness,
  flash_screen,
};

export default tools;
