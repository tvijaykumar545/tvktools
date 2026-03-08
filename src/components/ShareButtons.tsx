import { Share2, Twitter, Linkedin, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const fullUrl = `https://tvktools.lovable.app${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Share2 className="h-3 w-3" /> Share
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded p-1.5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
        title="Share on X (Twitter)"
      >
        <Twitter className="h-3.5 w-3.5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded p-1.5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-3.5 w-3.5" />
      </a>
      <button
        onClick={handleCopy}
        className="rounded p-1.5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
        title="Copy link"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <LinkIcon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
};

export default ShareButtons;
