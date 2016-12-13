#!/bin/bash

if [ "$1" = '--summary' ]; then
	echo "Camera summary:                                                                
Manufacturer: Canon Inc.
Model: Canon EOS 50D
  Version: 3-1.0.9
  Serial Number: 93e9fa5XXXXXXXXXc1b650d8d5c800186b
Vendor Extension ID: 0xb (2.0)

Capture Formats: JPEG
Display Formats: Association/Directory, Script, DPOF, MS AVI, MS Wave, JPEG, CRW, Unknown(b103), Unknown(bf02), Defined Type, Unknown(b104)

Device Capabilities:
	File Download, File Deletion, File Upload
	No Image Capture, No Open Capture, Canon EOS Capture, Canon EOS Shutter Button

Storage Devices Summary:
store_00010001:
	StorageDescription: CF
	VolumeLabel: None
	Storage Type: Removable RAM (memory card)
	Filesystemtype: Digital Camera Layout (DCIM)
	Access Capability: Read-Write
	Maximum Capability: 8016560128 (7645 MB)
	Free Space (Bytes): 8016429056 (7645 MB)
	Free Space (Images): -1

Device Property Summary:
Property 0xd402:(read only) (type=0xffff) 'Canon EOS 50D'
Property 0xd407:(read only) (type=0x6) 1
Property 0xd406:(readwrite) (type=0xffff) 'Unknown Initiator'" 
else
	echo "Usage: gphoto2 [-?qvalLnPTDR] [-?|--help] [--usage] [--debug] [--debug-loglevel=STRING] [--debug-logfile=FILENAME] [-q|--quiet] [--hook-script=FILENAME] [--stdout]
        [--stdout-size] [--auto-detect] [--show-exif=STRING] [--show-info=STRING] [--summary] [--manual] [--about] [--storage-info] [--shell] [-v|--version]
        [--list-cameras] [--list-ports] [-a|--abilities] [--port=FILENAME] [--speed=SPEED] [--camera=MODEL] [--usbid=USBIDs] [--list-config] [--list-all-config]
        [--get-config=STRING] [--set-config=STRING] [--set-config-index=STRING] [--set-config-value=STRING] [--reset] [--keep] [--keep-raw] [--no-keep]
        [--wait-event=COUNT, SECONDS, MILLISECONDS or MATCHSTRING] [--wait-event-and-download=COUNT, SECONDS, MILLISECONDS or MATCHSTRING] [--capture-preview] [--show-preview]
        [-B|--bulb=SECONDS] [-F|--frames=COUNT] [-I|--interval=SECONDS] [--reset-interval] [--capture-image] [--trigger-capture] [--capture-image-and-download]
        [--capture-movie=COUNT or SECONDS] [--capture-sound] [--capture-tethered=COUNT, SECONDS, MILLISECONDS or MATCHSTRING] [--trigger-capture] [-l|--list-folders]
        [-L|--list-files] [-m|--mkdir=DIRNAME] [-r|--rmdir=DIRNAME] [-n|--num-files] [-p|--get-file=RANGE] [-P|--get-all-files] [-t|--get-thumbnail=RANGE]
        [-T|--get-all-thumbnails] [--get-metadata=RANGE] [--get-all-metadata] [--upload-metadata=STRING] [--get-raw-data=RANGE] [--get-all-raw-data] [--get-audio-data=RANGE]
        [--get-all-audio-data] [-d|--delete-file=RANGE] [-D|--delete-all-files] [-u|--upload-file=FILENAME] [--filename=FILENAME_PATTERN] [-f|--folder=FOLDER] [-R|--recurse]
        [--no-recurse] [--new] [--force-overwrite] [--skip-existing]" 
fi
