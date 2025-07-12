export const useFile = () => {
  const handleFile = (
    accept: string
  ): Promise<{ getFiles: File[]; error: string }> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      const MAX_FILE_SIZE = 1024 * 1024 * 10; // 改為 10MB
      input.type = "file";
      input.accept = accept;
      input.multiple = true;

      input.onchange = () => {
        const files = input.files;
        const getFiles: File[] = [];
        let error = "";

        if (files) {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > MAX_FILE_SIZE) {
              error = "檔案大小不得超過 10MB";
              continue;
            }
            getFiles.push(file);
          }
        }

        resolve({ getFiles, error });
      };

      input.click();
    });
  };

  return { handleFile };
};
