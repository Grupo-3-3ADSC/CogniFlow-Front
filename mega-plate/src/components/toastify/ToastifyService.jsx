import { toast } from "react-toastify";

export const toastSucess = (mensagem) => {
    toast.success(mensagem , {
        position:"top-right",
        autoClose:1500,
    });
}

export const toastError = (mensagem) => {
    toast.error(mensagem, {
        position:"top-right",
        autoClose:1500
    });
}