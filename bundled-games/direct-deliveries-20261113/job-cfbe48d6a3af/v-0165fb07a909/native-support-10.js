
      // The rigged dragon is kept in assets/ as a real file so publishing hosts it separately
      // instead of shipping half a megabyte of base64 inside this page.
      const DRAGON_GLB_URL =
        "./_runtime_resources/0b5ee88709d8d8818a3b3374.glb";
      window.CHARACTER = "dragon"; // build switch, see dev/build.py
      const DRAGON_TEX = {
        base: "./_runtime_resources/2c629018fd252b97d6f99c9a.webp",
        normal:
          "./_runtime_resources/db061d125f8ebb1e415836aa.webp",
      };
    