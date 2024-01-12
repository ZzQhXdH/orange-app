use tokio::io::AsyncReadExt;
use tokio_serial::SerialStream;

use crate::{error::AppErr, utils::new_buf};


const HEAD: u16 = 0xE11E;
const HEAD0: u8 = 0xE1;
const HEAD1: u8 = 0x1E;
const END: u8 = 0xEF;

fn xor_sum(buf: &[u8]) -> u8 {
    let mut s = 0;
    for v in buf {
        s = s ^ *v;
    }
    s
}

async fn head_sync(stream: &mut SerialStream) -> Result<usize, AppErr> {
    let mut buf: [u8; 1] = [0; 1];
    let mut flag = false;
    loop {
        let n = stream.read(&mut buf).await?;
        if n <= 0 {
            return AppErr::new_with_msg("串口被关闭");
        }
        if flag && (buf[0] == HEAD1) {
            break;
        }
        flag = buf[0] == HEAD0;
    }
    
    let n = stream.read(&mut buf).await?;
    if n <= 0 {
        return AppErr::new_with_msg("串口被关闭");
    }
    
    Ok( buf[0] as usize )
}

pub async fn read_frame(stream: &mut SerialStream) -> Result<Box<[u8]>, AppErr> {

    let len = head_sync(stream).await?;

    if len < 6 {
        return Err(AppErr::Proto("长度错误"));
    }
    let len = len - 3;
    let mut buf = new_buf(len);
    
    stream.read_exact(&mut buf).await?;

    let s = xor_sum(&buf[..(len-2)]);
    if s != buf[len - 2] {
        return Err(AppErr::Proto("校验错误"));
    }

    if END != buf[len - 1] {
        return Err(AppErr::Proto("帧尾错误"));
    }

    Ok( buf )
}
