using System;
using System.Runtime.InteropServices;

namespace WinAudio
{
    [Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IAudioEndpointVolume
    {
        int RegisterControlChangeNotify(IntPtr pNotify);
        int UnregisterControlChangeNotify(IntPtr pNotify);
        int GetChannelCount(out uint pnChannelCount);
        int SetMasterVolumeLevel(float fLevelDB, [In] ref Guid pguidEventContext);
        int SetMasterVolumeLevelScalar(float fLevel, [In] ref Guid pguidEventContext);
        int GetMasterVolumeLevel(out float pfLevelDB);
        int GetMasterVolumeLevelScalar(out float pfLevel);
        int SetChannelVolumeLevel(uint nChannel, float fLevelDB, [In] ref Guid pguidEventContext);
        int SetChannelVolumeLevelScalar(uint nChannel, float fLevel, [In] ref Guid pguidEventContext);
        int GetChannelVolumeLevel(uint nChannel, out float pfLevelDB);
        int GetChannelVolumeLevelScalar(uint nChannel, out float pfLevel);
        int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, [In] ref Guid pguidEventContext);
        int GetMute(out bool pbMute);
        int GetVolumeStepInfo(out uint pnStep, out uint pnStepCount);
        int VolumeStepUp([In] ref Guid pguidEventContext);
        int VolumeStepDown([In] ref Guid pguidEventContext);
        int QueryHardwareSupport(out uint pdwHardwareSupportMask);
        int GetVolumeRange(out float pflVolumeMindB, out float pflVolumeMaxdB, out float pflVolumeIncrementdB);
    }

    [Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IMMDevice
    {
        int Activate(ref Guid id, int clsCtx, IntPtr activationParams, [MarshalAs(UnmanagedType.IUnknown)] out object interfacePointer);
        int OpenPropertyStore(int stgmAccess, out object properties);
        int GetId([MarshalAs(UnmanagedType.LPWStr)] out string strId);
        int GetState(out int state);
    }

    [Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IMMDeviceEnumerator
    {
        int EnumAudioEndpoints(int dataFlow, int stateMask, out object devices);
        int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice endpoint);
        int GetDevice(string pwstrId, out IMMDevice endpoint);
        int RegisterEndpointNotificationCallback(IntPtr pClient);
        int UnregisterEndpointNotificationCallback(IntPtr pClient);
    }

    [ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
    class MMDeviceEnumeratorComObject { }

    class Program
    {
        static IAudioEndpointVolume GetMasterVolume()
        {
            var enumerator = (IMMDeviceEnumerator)(new MMDeviceEnumeratorComObject());
            IMMDevice dev;
            // dataFlow: 0 = eRender, role: 1 = eMultimedia
            int hr = enumerator.GetDefaultAudioEndpoint(0, 1, out dev);
            if (hr != 0) Marshal.ThrowExceptionForHR(hr);
            var iid = new Guid("5CDF2C82-841E-4546-9722-0CF74078229A");
            object o;
            hr = dev.Activate(ref iid, 1 | 2 | 4 | 16, IntPtr.Zero, out o);
            if (hr != 0) Marshal.ThrowExceptionForHR(hr);
            return (IAudioEndpointVolume)o;
        }

        static int Main(string[] args)
        {
            try
            {
                var vol = GetMasterVolume();
                Guid emptyGuid = Guid.Empty;

                if (args.Length > 0)
                {
                    float newVol;
                    if (float.TryParse(args[0], System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out newVol))
                    {
                        if (newVol > 1.0f) newVol /= 100.0f;
                        if (newVol < 0.0f) newVol = 0.0f;
                        if (newVol > 1.0f) newVol = 1.0f;
                        int hr = vol.SetMasterVolumeLevelScalar(newVol, ref emptyGuid);
                        if (hr != 0) Marshal.ThrowExceptionForHR(hr);

                        if (newVol > 0.0f)
                        {
                            bool isMuted;
                            vol.GetMute(out isMuted);
                            if (isMuted) vol.SetMute(false, ref emptyGuid);
                        }
                    }
                }

                float currentLevel;
                int hrGet = vol.GetMasterVolumeLevelScalar(out currentLevel);
                if (hrGet != 0) Marshal.ThrowExceptionForHR(hrGet);
                int percent = (int)Math.Round(currentLevel * 100.0f);
                Console.WriteLine(percent);
                return 0;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return 1;
            }
        }
    }
}
