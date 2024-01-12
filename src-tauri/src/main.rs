// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod device;
mod error;
mod utils;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, 
            device::serial_port_name,
            device::conn_open,
            device::conn_write,
            device::conn_close,
            device::conn_is_open
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
