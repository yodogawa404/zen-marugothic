import unicode_ranges from "@yodogawa404/get-unicode-chunk-range_jp/jp.json" with { type: "json" };

import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const source_fonts = {
  300: "../../resources/OTF/ZenMaruGothic-Light.otf",
  400: "../../resources/OTF/ZenMaruGothic-Regular.otf",
  500: "../../resources/OTF/ZenMaruGothic-Medium.otf",
  700: "../../resources/OTF/ZenMaruGothic-Bold.otf",
  900: "../../resources/OTF/ZenMaruGothic-Black.otf",
};

let distFileNames = {};
let woff2FileUnicodeList = {};
{
  function getUnicodesString(arr) {
    let str = "";
    for (let i = 0; i < arr.length; i++) {
      if (i == arr.length - 1) {
        str = str + arr[i];
      } else str = str + arr[i] + ",";
    }

    return str;
  }

  Object.keys(source_fonts).map((key) => {
    console.log(source_fonts[key]);

    for (let i_unicode = 0; i_unicode < unicode_ranges.length; i_unicode++) {
      console.log(i_unicode);
      let unicodes = "" + getUnicodesString(unicode_ranges[[i_unicode]]);

      const distDirName = "../zen-marugothic/fonts/";
      const distFileName = `ZenMaruGothic_${key}-${String(i_unicode).padStart(3, "0")}`;
      const distFileExt = ".otf";
      console.log(
        execFileSync("hb-subset", [
          source_fonts[key],
          `--unicodes=${unicodes}`,
          "--layout-features=*",
          `--output-file=${distDirName + distFileName + distFileExt}`,
        ]),
      );

      distFileNames[distFileName] = distDirName + distFileName + distFileExt;
      woff2FileUnicodeList[distDirName + distFileName + ".woff2"] = {
        unicodes: unicodes,
        weight: key,
        filename: distFileName + ".woff2",
      };
    }
  });
}

{
  Object.keys(distFileNames).map((key) => {
    console.log(execFileSync("woff2_compress", [distFileNames[key]]));
    console.log(execFileSync("rm", [distFileNames[key]]));
  });
}
{
  let full_css = "";
  Object.keys(woff2FileUnicodeList).map((key) => {
    full_css =
      full_css +
      `@font-face {font-family: 'Zen Maru Gothic';font-display: swap;font-weight: ${woff2FileUnicodeList[key]["weight"]};src: url(./fonts/${woff2FileUnicodeList[key]["filename"]}) format('woff2');unicode-range: ${woff2FileUnicodeList[key]["unicodes"]};}\n`;
  });

  writeFileSync("../zen-marugothic/index.css", full_css);
}
