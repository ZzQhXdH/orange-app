use std::ptr::NonNull;


#[inline]
pub fn get_mut<T>(v: &T) -> &mut T {
    unsafe {
        NonNull::new_unchecked(v as *const T as *mut T).as_mut()
    }
}

pub fn new_buf(len: usize) -> Box<[u8]> {
    let mut buf = Vec::with_capacity(len);
    unsafe {
        buf.set_len(len);
    }
    buf.into_boxed_slice()
}

