export type ReadFileResult = {
    ext: string;
    bytes: Uint8Array;
};

export const readFile = async (file: File): Promise<ReadFileResult> => {
    const paths = file.name.split(".")
    return new Promise<ReadFileResult>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = () => {
            const ext = paths[paths.length - 1] || ""
            resolve({ ext, bytes: new Uint8Array(reader.result as ArrayBuffer) })
        }
        reader.onerror = (error) => reject(error)
    })
}

export const pickFiles = async (accept: string = "image/*", multiple: boolean = false): Promise<File[]> => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = accept
    input.multiple = multiple

    input.click()

    return new Promise<File[]>((resolve) => {
        input.addEventListener("change", () => resolve(Array.from(input.files ?? [])), { once: true })
        input.addEventListener("cancel", () => resolve([]), { once: true })
    })
}
