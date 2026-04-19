import { useState, useRef, useEffect } from 'react';
import styles from './Step2TemplateUpload.module.css';

interface Step2TemplateUploadProps {
  onTemplateLoaded: (imageData: string, position: { x: number; y: number }) => void;
  isLoading?: boolean;
}

export const Step2TemplateUpload: React.FC<Step2TemplateUploadProps> = ({
  onTemplateLoaded,
  isLoading = false
}) => {
  const [templateImage, setTemplateImage] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (templateImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = templateImage;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // If we already have a position, draw the marker
        if (selectedPosition) {
          drawMarker(ctx, selectedPosition);
        }
      };
    }
  }, [templateImage, selectedPosition]);

  const drawMarker = (ctx: CanvasRenderingContext2D, position: { x: number; y: number }) => {
    const markerSize = 30;
    ctx.strokeStyle = '#FF6B6B';
    ctx.fillStyle = '#FF6B6B';
    ctx.lineWidth = 2;

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(position.x - markerSize, position.y);
    ctx.lineTo(position.x + markerSize, position.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(position.x, position.y - markerSize);
    ctx.lineTo(position.x, position.y + markerSize);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(position.x, position.y, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imageData = e.target?.result as string;
        setTemplateImage(imageData);
        setSelectedPosition(null);
      } catch (err) {
        setError('Failed to load image');
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !templateImage) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to canvas resolution
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const position = {
      x: x * scaleX,
      y: y * scaleY
    };

    setSelectedPosition(position);
    onTemplateLoaded(templateImage, position);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Step 2: Upload Certificate Template</h2>
        <p className={styles.description}>
          Upload a PNG or JPG image that serves as your certificate template. This image should contain
          the design, borders, logos, and any fixed content. Then click on the template to mark where
          the member's name should be placed.
        </p>

        {!templateImage ? (
          <div className={styles.uploadArea}>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageUpload}
              className={styles.fileInput}
              disabled={isLoading}
              id="template-upload"
            />
            <label htmlFor="template-upload" className={styles.uploadLabel}>
              <span>🖼️ Click to upload certificate template (PNG or JPG)</span>
            </label>
          </div>
        ) : (
          <div className={styles.templateSection}>
            <h3>Certificate Template Preview</h3>
            <p className={styles.instructionText}>
              Click on the template to mark where the member's name should be displayed
            </p>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              onClick={handleCanvasClick}
              style={{ cursor: 'crosshair' }}
            />
            {selectedPosition && (
              <div className={styles.positionInfo}>
                <p>
                  ✓ Position selected at: X={Math.round(selectedPosition.x)}, Y={Math.round(selectedPosition.y)}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setTemplateImage('');
                setSelectedPosition(null);
              }}
              className={styles.changeTemplateBtn}
              disabled={isLoading}
            >
              Change Template
            </button>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};
