
#[inline]
pub fn get_mut<T>(v: &T) -> &mut T {
    unsafe {
        let const_v: *const T = v as *const T;
        let mut_v = const_v as *mut T;
        &mut *mut_v
    }
}

pub fn new_buf(len: usize) -> Box<[u8]> {
    let mut buf = Vec::with_capacity(len);
    unsafe {
        buf.set_len(len);
    }
    buf.into_boxed_slice()
}

