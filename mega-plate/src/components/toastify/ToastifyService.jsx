import { toast } from "react-toastify";



export const toastSuccess = (mensagem) => {
    toast.success(mensagem, {
        position: "top-right",
        autoClose: 1500,
    });
};

export const toastError = (mensagem) => {
    toast.error(mensagem, {
        position: "top-right",
        autoClose: 1500,
    });
};

export const toastInfo = (mensagem) => {
    toast.info(mensagem, {
        position: "top-right",
        autoClose: 1500,
    });
};

export const toastWarning = (mensagem) => {
    toast.warn(mensagem, {
        position: "top-right",
        autoClose: 1500,
    });
};
