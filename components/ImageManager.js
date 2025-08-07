import { supabase } from '../lib/supabaseClient';

const ImageManager = ({ images = [], onImageDelete, onNewImages, storageBucket }) => {
  const handleNewImages = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImageUrls = [];
    for (const file of files) {
      const fileName = `${storageBucket}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('images').upload(fileName, file);
      if (error) {
        console.error('Upload error:', error);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      newImageUrls.push(publicUrl);
    }
    onNewImages(newImageUrls);
  };

  return (
    <div className="col-span-full">
      <label className="block text-sm font-medium text-gray-700">Images</label>
      <div className="mt-1 flex flex-wrap gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-300">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onImageDelete(img)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
            >
              X
            </button>
          </div>
        ))}
        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer">
          <label htmlFor="new-images-upload" className="cursor-pointer text-3xl text-gray-400">
            +
            <input id="new-images-upload" type="file" multiple accept="image/*" onChange={handleNewImages} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ImageManager;
