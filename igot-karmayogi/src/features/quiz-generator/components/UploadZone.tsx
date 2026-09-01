import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';

interface UploadZoneProps {
  onFile:   (file: File) => void;
  loading?: boolean;
  error?:   string;
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf':       ['.pdf'],
  'application/msword':    ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain':            ['.txt'],
};

export default function UploadZone({ onFile, loading, error }: UploadZoneProps) {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) onFile(accepted[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept:    ACCEPTED_TYPES,
    maxFiles:  1,
    maxSize:   20 * 1024 * 1024, // 20 MB
    disabled:  loading,
  });

  const selectedFile = acceptedFiles[0];

  return (
    <div className="space-y-4">
      <motion.div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10',
          loading && 'opacity-60 cursor-not-allowed',
        )}
        whileHover={loading ? {} : { scale: 1.01 }}
        whileTap={loading ? {} : { scale: 0.99 }}
        role="button"
        aria-label="Upload learning material. Accepts PDF, DOC, DOCX, or TXT files up to 20MB"
        tabIndex={0}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          {loading ? (
            <Spinner size="lg" className="text-primary-600" />
          ) : (
            <span className="text-5xl" aria-hidden="true">
              {isDragActive ? '📥' : selectedFile ? '✅' : '📁'}
            </span>
          )}

          <div>
            {loading ? (
              <p className="text-body font-medium text-slate-700 dark:text-slate-300">Uploading…</p>
            ) : isDragActive ? (
              <p className="text-body font-medium text-accent-600 dark:text-accent-400">Drop it here</p>
            ) : selectedFile ? (
              <div>
                <p className="text-body font-medium text-primary-700 dark:text-primary-300">{selectedFile.name}</p>
                <p className="text-body-sm text-slate-500 mt-0.5">{(selectedFile.size / 1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-body font-medium text-slate-700 dark:text-slate-300">
                  Drag & drop your learning material here
                </p>
                <p className="text-body-sm text-slate-500 mt-1">
                  Supports PDF, DOCX, DOC, TXT — up to 20 MB
                </p>
              </div>
            )}
          </div>

          {!loading && !selectedFile && (
            <Button variant="outline" size="sm" type="button">
              Or browse files
            </Button>
          )}
        </div>
      </motion.div>

      {error && (
        <p role="alert" className="text-body-sm text-gap-critical flex items-center gap-1.5">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}
