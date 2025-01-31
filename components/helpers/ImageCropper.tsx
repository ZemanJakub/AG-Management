"use client";

import React, { useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import setCanvasPreview from "@/components/helpers/setCanvasPreview";
import { Button } from "@heroui/react";
import { CameraIcon } from "@/components/my-icons/camera-icon";
import { handleFileConvert } from "./frontEndImageResize";
import { toast } from "react-toastify";

interface UpdatePhotoInfo {
  id: string;
  firstName: string;
  secondName: string;
}
interface UploadHandlerInfoProps {
  bigPhoto: string;
  smallPhoto: string;
}
interface UpdatePhotoInfoProps {
  uploadHandler: any;
}

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

const ImageCropper: React.FC<UpdatePhotoInfoProps> = ({
  uploadHandler
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<any>();
  const [error, setError] = useState<string>("");
  const [isCroped, setIsCroped] = useState<boolean>(false);


  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const MAX_WIDTH = 4000;
  const MAX_HEIGHT = 4000;
  
  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.info("Nahrávám fotografii.", {
      position: "top-right",
      autoClose: 8000,
      theme: "dark",
    });
  
    const file = e.target.files?.[0];
    if (!file) return;
  
    // Převedeme HEIC/HEIF na JPEG nebo PNG (pokud je potřeba)
    const isHeicOrHeif =
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");
  
    let convertedFile: Blob | null = file;
    if (isHeicOrHeif) {
      const converted = await handleFileConvert(file);
      convertedFile = Array.isArray(converted) ? converted[0] : converted; // Vyber první prvek, pokud je pole
    }
  
    if (!convertedFile) {
      setError("Nepodařilo se zpracovat soubor.");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageElement = new Image();
      imageElement.src = event.target?.result as string;
  
      imageElement.onload = async () => {
        let { width, height } = imageElement;
  
        // Pokud je obrázek větší než maximální rozměry, zmenšíme ho
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const scaleFactor = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * scaleFactor);
          height = Math.round(height * scaleFactor);
        }
  
        // Vytvoření canvasu pro úpravu velikosti
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        if (!ctx) {
          setError("Nepodařilo se vytvořit zmenšený obrázek.");
          return;
        }
  
        canvas.width = width;
        canvas.height = height;
  
        ctx.drawImage(imageElement, 0, 0, width, height);
  
        // Funkce pro zmenšení kvality, pokud je obrázek příliš velký
        const compressImage = async (canvas: HTMLCanvasElement, quality: number = 0.9): Promise<Blob> => {
          return new Promise((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Chyba při převodu canvasu na Blob."));
                }
              },
              "image/jpeg",
              quality
            );
          });
        };
  
        let quality = 0.9;
        let blob = await compressImage(canvas, quality);
  
        // Snížení kvality, pokud je obrázek stále větší než 5MB
        while (blob.size > MAX_FILE_SIZE_BYTES && quality > 0.3) {
          quality -= 0.1;
          blob = await compressImage(canvas, quality);
        }
  
        // Převod Blob zpět na Base64 nebo File, podle toho, co potřebuješ
        const newFile = new File([blob], "compressed_image.jpg", { type: "image/jpeg" });
  
        // Čtení nového souboru jako DataURL pro zobrazení v ImageCropperu
        const newReader = new FileReader();
        newReader.onload = () => {
          setImgSrc(newReader.result as string);
        };
        newReader.readAsDataURL(newFile);
      };
    };
  
    reader.readAsDataURL(convertedFile);
  };
  



  // const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   toast.info("Nahrávám fotografii.", {
  //     position: "top-right",
  //     autoClose: 8000,
  //     theme: "dark",
  //   });
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const isHeicOrHeif =
  //     file.name.toLowerCase().endsWith(".heic") ||
  //     file.name.toLowerCase().endsWith(".heif");

  //   const convertedFile = isHeicOrHeif ? await handleFileConvert(file) : file;

  //   const reader = new FileReader(); 
  //   reader.addEventListener("load", () => {
  //     const imageElement = new Image();
  //     const imageUrl = reader.result?.toString() || "";
  //     imageElement.src = imageUrl;

  //     imageElement.addEventListener("load", (e: any) => {
  //       if (error) setError("");
  //       if (e.currentTarget) {
  //         const { naturalWidth, naturalHeight } = e.currentTarget;
  //         if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
  //           setError("Obrázek je příliš malý.");
  //           setImgSrc("");
  //         }
  //       }
  //     });

  //     setImgSrc(imageUrl);
  //   });

  //   reader.readAsDataURL(convertedFile as Blob);
  // };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    toast.dismiss();
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    const crop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  };

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <div className="relative w-36 h-auto">
        <form ref={formRef}>
          <input
            type="file"
            name="photo"
            id="photo"
            accept="image/*,.heic,.heif"
            onChange={onSelectFile}
            className="top-1 left-2 w-32 h-auto absolute cursor-pointer z-20 opacity-0"
          />
        </form>
        <Button
          color="secondary"
          startContent={<CameraIcon />}
          className="w-40 z-10 mb-4"
          aria-label="Vybrat soubor"
        >
          Vybrat soubor
        </Button>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {imgSrc && (
        <div className="flex flex-col items-center">
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
            circularCrop
            keepSelection
            aspect={ASPECT_RATIO}
            minWidth={MIN_DIMENSION}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Upload"
              style={{ maxHeight: "70vh" }}
              className="rounded-md"
              onLoad={onImageLoad}
            />
          </ReactCrop>
          <Button
            type="button"
            variant="bordered"
            color="secondary"
            className="mt-8"
            onPress={async () => {
              if (imgRef.current && previewCanvasRef.current) {
                setIsCroped(true);
                setCanvasPreview(
                  imgRef.current, // HTMLImageElement
                  previewCanvasRef.current, // HTMLCanvasElement
                  convertToPixelCrop(
                    crop,
                    imgRef.current.width,
                    imgRef.current.height
                  )
                );
              }
            }}
          >
            Oříznout fotografii
          </Button>
        </div>
      )}
      {crop && (
        <div className="flex justify-center pt-4">
          <div className="grid justify-items-center w-36 h-auto gap-y-8">
            <canvas
              ref={previewCanvasRef}
              className="border border-gray-300 rounded-full w-32 h-32"
            />
            {isCroped ? (
              <Button
                type="submit"
                variant="bordered"
                color="secondary"
                onPress={() => {
                  if (previewCanvasRef.current !== null) {
                    const dataUrl = previewCanvasRef.current.toDataURL();
                    uploadHandler(dataUrl);

                    // odeslat data do serveru
                  }
                }}
              >
                Nahrát fotografii
              </Button>
            ) : (
              <Button
                type="button"
                variant="bordered"
                color="default"
                isDisabled
              >
                Nahrát fotografii
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
