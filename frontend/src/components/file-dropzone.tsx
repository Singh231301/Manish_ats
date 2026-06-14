import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  fileName?: string;
}

export function FileDropzone({ onFileSelect, isUploading, fileName }: Props) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type.includes("wordprocessingml.document")) {
        onFileSelect(file);
      } else {
        alert("Please upload a PDF or DOCX file.");
      }
    }
  };

  return (
    <div
      className={`dropzone ${isDragActive ? "active" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {fileName ? (
        <>
          <div style={{ color: "var(--green)", fontSize: 40, marginBottom: 16 }}>✓</div>
          <h3 style={{ fontSize: 18, marginBottom: 8, fontWeight: 700, color: "var(--green)" }}>
            File Uploaded Successfully!
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>
            {fileName}
          </p>
        </>
      ) : (
        <>
          <UploadCloud size={48} color={isDragActive ? "var(--primary)" : "var(--text-muted)"} style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, marginBottom: 8, fontWeight: 700 }}>
            {isUploading ? "Processing Document..." : "Drag & Drop your resume here"}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Supports PDF and DOCX files
          </p>
        </>
      )}
      <input 
        type="file" 
        accept=".pdf,.docx" 
        style={{ display: "none" }} 
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
          // Clear the input so selecting the same file again works
          e.target.value = '';
        }}
      />
      <div className="button secondary" style={{ marginTop: 24, display: "inline-flex" }}>
        Browse Files
      </div>
    </div>
  );
}
