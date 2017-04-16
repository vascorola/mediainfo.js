//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Linux: g++ -o howtouse HowToUse_Dll.cpp  -lmediainfo -lzen -ldl
// Windows: cl /Fehowtouse.exe HowToUse_Dll.cpp
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

#include <MediaInfo/MediaInfo.h>
#include <iostream>
#include <iomanip>
#include <stdio.h>
//#include <emscripten/bind.h>

using namespace MediaInfoLib;


int main () {
    std::wcout << "Starting dlltest..." << std::endl;

    //From: preparing an example file for reading
    FILE* F=fopen("testfiles/HEALTH-ECIGARETTES-USA.MP4", "rb"); //You can use something else than a file
    if (F==0) {
        std::wcout << "File not found. Exit..." << std::endl;
        return 1;
    }

    //From: preparing a memory buffer for reading
    unsigned char* From_Buffer=new unsigned char[7*188]; //Note: you can do your own buffer
    size_t From_Buffer_Size; //The size of the read file buffer

    //From: retrieving file size
    fseek(F, 0, SEEK_END);
    long F_Size=ftell(F);
    fseek(F, 0, SEEK_SET);

    //Initializing MediaInfo
    MediaInfo MI;

    MI.Option(__T("ParseSpeed"), __T("0"));

    //Preparing to fill MediaInfo with a buffer
    MI.Open_Buffer_Init(F_Size, 0);

    //The parsing loop
    int totalRead = 0;
    do
    {
        //Reading data somewhere, do what you want for this.
        From_Buffer_Size=fread(From_Buffer, 1, 7*188, F);
        totalRead += From_Buffer_Size;
        printf("Read %d bytes.\n", From_Buffer_Size);

        //Sending the buffer to MediaInfo
        size_t Status=MI.Open_Buffer_Continue(From_Buffer, From_Buffer_Size);
        if (Status&0x08) //Bit3=Finished
            break;

        //Testing if there is a MediaInfo request to go elsewhere
        int64_t seekPos = MI.Open_Buffer_Continue_GoTo_Get();
        if (seekPos!=(int64_t)-1)
        {
            printf("Seeking to offset %lld.", seekPos);
            fseek(F, (long)seekPos, SEEK_SET);   //Position the file
            MI.Open_Buffer_Init(F_Size, ftell(F));                          //Informing MediaInfo we have seek
        }
    }
    while (From_Buffer_Size>0);
    printf("Done, read %d bytes in total.\n", totalRead);
    //Finalizing
    MI.Open_Buffer_Finalize(); //This is the end of the stream, MediaInfo must finnish some work

    //Get() example
    String info = MI.Inform();
//    String To_Display=MI.Get(Stream_General, 0, __T("Format"));

    std::wcout << info << std::endl;
    return 0;
}

//EMSCRIPTEN_BINDINGS(dlltest) {
//    emscripten::function("parse", &parse);
//}
