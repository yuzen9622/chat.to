export const useFile = () => {
  const handleFile = async (accept: string) => {
    const input = document.createElement("input");
    const MAX_FILE_SIZE = 1024 * 1024 * 8;
    const getFiles: File[] = [];
    let error = "";
    input.type = "file";
    input.accept = accept;
    input.multiple = true;
    input.click();
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = target.files;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          if (file.size > MAX_FILE_SIZE) {
            error = "檔案大小不得超過10MB";
            return;
          }
          getFiles.push(file);
        }
      }
    };
    return { getFiles, error };
  };
  return { handleFile };
};
