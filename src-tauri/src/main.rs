// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use error::{AppErr, ErrorWrap, OptionWrap};
use serde::Deserialize;
use tauri::{PhysicalPosition, Window};
use winapi::{
    shared::windef::{HWND, POINT},
    um::winuser::{GetCursorPos, GetPointerInfo, ScreenToClient},
};

mod device;
mod error;
mod utils;

#[derive(Debug, Deserialize)]
struct Pos {
    x: i32,
    y: i32,
}

#[tauri::command]
fn set_position_offset(pos: Pos, win: Window) -> Result<(), AppErr> {
    let p = win.inner_position().wrap()?;
    win.set_position(PhysicalPosition::new(p.x + pos.x, p.y + pos.y))
        .wrap()?;
    // let hwnd = win.hwnd().wrap()?;
    // println!("{:#?}", get_pos(hwnd.0 as HWND));
    Ok(())
}

// fn get_pos(hwnd: HWND) -> Pos {
//     unsafe {
//         let mut pt: POINT = std::mem::zeroed();
//         // GetPointerInfo(pointerId, pointerInfo)
//         GetCursorPos(&mut pt);
//         ScreenToClient(hwnd, &mut pt);
//         Pos { x: pt.x, y: pt.y }
//     }
// }

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            device::serial_port_name,
            device::conn_open,
            device::conn_write,
            device::conn_close,
            device::conn_is_open,
            set_position_offset
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
