import { checkPassword, hashPassword } from "../utils/hashing.js";



describe.only("Password hashing and validation", () => {
    test("Returns true for valid passwords", async ()=> {
        const password = 'password123';
        const hash = await hashPassword(password, 10);
        const isMatch = await checkPassword(password, hash);
        expect(isMatch).toBe(true);
    })
    test("Returns false for invalid passwords", async ()=> {
        const password = 'password123';
        const invalidPassword = 'password456';
        const hash = await hashPassword(password, 10);
        const isMatch = await checkPassword(invalidPassword, hash);
        expect(isMatch).toBe(false);
    })
})