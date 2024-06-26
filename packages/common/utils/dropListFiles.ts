import { UploadFile } from 'antd';
import { RcFile } from 'antd/es/upload';

export const dropListFiles = (files: UploadFile[]) => {
    const listFileUploaded = files
        .filter((item) => item.status === 'done')
        .map((item) => ({ url: item.name }));

    const listNewImage = files
        .filter((item) => !!item.originFileObj)
        .map((item) => item.originFileObj as RcFile);

    return { filesUploaded: listFileUploaded, fileNotUpload: listNewImage };
};
