import multer from "multer";

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "public/temp");
  },
  filename: (_, file, cb) => {
    let fileExtension = "";
    if (file.originalname.split(".").length > 1) {
      fileExtension = file.originalname.substring(file.originalname.lastIndexOf("."));
    }
    const fileNameWithoutExtension = file.originalname
      .split(".")
      .join("-")
      .toLowerCase()
      ?.split(".")[0];
    cb(
      null,
      fileNameWithoutExtension ||
        "" +
          Date.now() +
          Math.ceil(Math.random() * 1e5) + // avoid rare name conflict
          fileExtension
    );
  },
});

export const upload = multer({ storage });
