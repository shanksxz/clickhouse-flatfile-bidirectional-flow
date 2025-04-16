import { Button } from '@/components/ui/button';

type ExportButtonProps = {
  onExport: () => void;
  isExporting: boolean;
  disabled: boolean;
};

export const ExportButton = ({ 
  onExport, 
  isExporting, 
  disabled 
}: ExportButtonProps) => {
  return (
    <Button 
      onClick={onExport} 
      disabled={disabled || isExporting}
      className="w-full"
    >
      {isExporting ? 'Exporting...' : 'Export to CSV'}
    </Button>
  );
}; 