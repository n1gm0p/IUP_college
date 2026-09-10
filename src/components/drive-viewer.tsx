"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { normalizeExternalUrl } from "@/lib/constants";
import { toGoogleEmbedUrl } from "@/lib/drive-embed";

interface DriveViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export function DriveViewer({ url, title = "Материал", onClose }: DriveViewerProps) {
  const original = normalizeExternalUrl(url);
  const embed = toGoogleEmbedUrl(url);

  return (
    <BottomSheet open onClose={onClose} title={title} large>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-gray-500">
            Просмотр на сайте · доступ «по ссылке»
          </p>
          <a
            href={original}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[15px] text-[#007AFF] active:opacity-60"
          >
            В Google
          </a>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-white">
          {embed ? (
            <iframe
              title={title}
              src={embed}
              className="h-[70vh] w-full border-0 bg-white sm:h-[75vh]"
              allow="autoplay"
            />
          ) : (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[15px] text-gray-500">Не удалось встроить ссылку</p>
              <a
                href={original}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[17px] text-[#007AFF]"
              >
                Открыть в новой вкладке
              </a>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
