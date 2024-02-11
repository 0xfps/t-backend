import generateUniqueId from "generate-unique-id"
/**
 * Returns a unique string of length `length` that can
 * be used for an ID.
 * 
 * @param length Length of ID.
 */
export function getUniqueId(length: number = 10): string {
    return generateUniqueId({
        length: length,
        includeSymbols: ["-"],
        excludeSymbols: ["/", "\\", "_", `"`, `'`]
    })
}