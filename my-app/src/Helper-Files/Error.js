import react from 'react';

var error_print = (err) => console.error(err);

export async function packaged(title, code) {
    // try {
        code();
    // } catch (e) {
    //     error_print('Package caught error ' + e.toString());
    // }
}
