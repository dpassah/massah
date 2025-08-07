import { supabase } from '../lib/supabaseClient';

const ImageManager = ({ images = [], onImageChange, storageBucket }) => {
  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${storageBucket}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      alert('Erreur lors du téléchargement de l\'image.');
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    onImageChange(index, publicUrl);
  };

  const handleDelete = (index) => {
    onImageChange(index, null); // Set the image at this index to null
  };

  return (
    <div className="form-field-full">
      <label className="block text-sm font-medium text-gray-700">Images (max 3)</label>
      <div className="mt-1 flex flex-wrap gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-300 flex items-center justify-center">
            {images[index] ? (
              <>
                <img src={images[index]} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                >
                  X
                </button>
              </>
            ) : (
              <label htmlFor={`image-upload-${index}`} className="cursor-pointer text-3xl text-gray-400">
                +
                <input
                  id={`image-upload-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageManager;