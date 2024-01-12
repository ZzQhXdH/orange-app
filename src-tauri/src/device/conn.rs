
use std::sync::Arc;

use tauri::Window;
use tokio::{io::AsyncWriteExt, sync::Semaphore};
use tokio_serial::{SerialPortBuilderExt, SerialStream};

use crate::{error::{AppErr, IoErr}, utils::get_mut};

use super::proto::read_frame;

const BAUD_RATE: u32 = 115200;
const NOTIFY_FRAME_EVENT: &'static str = "ON_SERIAL_RECEIVE";

unsafe impl Sync for DeviceConn {}
unsafe impl Send for DeviceConn {}

pub struct DeviceConn {
    port: SerialStream,
    exit_sem: Semaphore,
    window: Window,
}

pub type SharedConn = Arc<DeviceConn>;

impl DeviceConn {

    pub fn new(window: Window, name: &str) -> Result<SharedConn, AppErr> {
        let builder = tokio_serial::new(name, BAUD_RATE);
        let stream = builder.open_native_async()?;
        let conn = DeviceConn { 
            window,
            port: stream,
            exit_sem: Semaphore::new(0)
        };
        let conn = Arc::new(conn);
        tokio::spawn( receive_loop(conn.clone()) );
        Ok(conn)
    }

    pub async fn write(&self, buf: &[u8]) -> Result<(), IoErr> {
        let stream = get_mut(&self.port);
        stream.write_all(buf).await?;
        Ok(())
    }

    pub fn exit_reader(&self) {
        self.exit_sem.add_permits(1);
    }

    pub fn notify_receive(&self, frame: Box<[u8]>) {
        let ret = self.window.emit(NOTIFY_FRAME_EVENT, frame);
        if let Err(e) = ret {
            println!("notify err:{}", e);
        }
    }

    async fn read(&self) -> Result<Box<[u8]>, AppErr> {
        tokio::select! {
            frame = read_frame( get_mut(&self.port) ) => {
                frame
            }
            _ = self.exit_sem.acquire() => {
                AppErr::new_with_msg("读取退出")
            }
        }
    }
}


async fn receive_loop(conn: SharedConn) {
    loop {
        let ret = conn.read().await;
        match ret {
            Ok(frame) => {
                conn.notify_receive(frame);
            }
            Err(AppErr::Proto(s)) => {  println!("recv:{}", s);}
            _ => { break; }
        }
    }
    println!("reader exit");
}


