import bcrypt from 'bcryptjs';

export const hashPassword = async (pass, rounds) => {
    const salt = await bcrypt.genSalt(rounds);
    const hashedPass = await bcrypt.hash(pass, salt);
    return hashedPass;
};

export const checkPassword = async (pass, hash) => {
    const check = await bcrypt.compare(pass, hash);
    return check;
}