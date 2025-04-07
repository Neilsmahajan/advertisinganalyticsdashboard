import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

interface DownloadButtonProps {
  isLoading: boolean;
  onClick: () => void;
  text: string;
  loadingText: string;
  className?: string;
}

export function DownloadButton({
  isLoading,
  onClick,
  text,
  loadingText,
  className = "bg-[#47adbf] hover:bg-[#47adbf]/90 text-white",
}: DownloadButtonProps) {
  return (
    <Button className={className} onClick={onClick} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}
