import ExcelUpload from '../ExcelUpload';

export default function ExcelUploadExample() {
  return (
    <div className="p-8 max-w-2xl">
      <ExcelUpload
        onUpload={(file) => {
          console.log('File uploaded:', file.name);
        }}
      />
    </div>
  );
}
