import type { Question } from "@/data/questions";

type ImagePriority = "high" | "low" | "auto";

const decodedImageSrcs = new Set<string>();
const pendingImageWarmups = new Map<string, Promise<void>>();
const retainedImages = new Map<string, HTMLImageElement>();

const setImagePriority = (img: HTMLImageElement, priority: ImagePriority) => {
  const imageWithPriority = img as HTMLImageElement & { fetchPriority?: ImagePriority };
  if (imageWithPriority.fetchPriority !== undefined) {
    imageWithPriority.fetchPriority = priority;
  }
};

export const isImageWarm = (src: string) => decodedImageSrcs.has(src);

export const warmImage = (src: string, priority: ImagePriority = "auto"): Promise<void> => {
  if (decodedImageSrcs.has(src)) return Promise.resolve();

  const pending = pendingImageWarmups.get(src);
  if (pending) return pending;

  const img = new Image();
  img.decoding = "async";
  setImagePriority(img, priority);

  const warmup = new Promise<void>((resolve) => {
    const finalize = () => {
      decodedImageSrcs.add(src);
      retainedImages.set(src, img);
      pendingImageWarmups.delete(src);
      resolve();
    };

    img.onload = () => {
      img.decode().catch(() => undefined).finally(finalize);
    };

    img.onerror = finalize;
    img.src = src;

    if (img.complete) {
      img.decode().catch(() => undefined).finally(finalize);
    }
  });

  pendingImageWarmups.set(src, warmup);
  return warmup;
};

export const warmQuestion = (question: Question, priority: ImagePriority = "high") => {
  const sources = [question.gridImage, ...question.options];
  return Promise.all(sources.map((src) => warmImage(src, priority))).then(() => undefined);
};

export const warmQuestionSet = (questions: Question[], priority: ImagePriority = "auto") => {
  const uniqueSources = Array.from(
    new Set(questions.flatMap((question) => [question.gridImage, ...question.options])),
  );

  return Promise.all(uniqueSources.map((src) => warmImage(src, priority))).then(() => undefined);
};
