using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Management;
using System.Net;
using System.Text;
using System.Web.Script.Serialization;
using System.Windows.Forms;

class ProviderWindow : Form {
    const string Endpoint = "http://127.0.0.1:54799";
    readonly string root = AppDomain.CurrentDomain.BaseDirectory;
    readonly JavaScriptSerializer json = new JavaScriptSerializer();
    readonly Label status = new Label();
    readonly Button start = new Button(), stop = new Button(), panel = new Button();
    readonly Timer timer = new Timer();
    bool starting;
    string Script { get { return Path.Combine(root,"scripts","provider.mjs"); } }
    string PidFile { get { return Path.Combine(root,"data","server.pid.json"); } }

    public ProviderWindow() {
        Text = "Aurora Codex Provider";
        ClientSize = new Size(500,225);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        Font = new Font("Segoe UI",10);
        Label title = new Label { Text = Text, Font = new Font("Segoe UI",15,FontStyle.Bold) };
        title.SetBounds(24,20,450,32);
        status.SetBounds(24,62,450,26);
        TextBox address = new TextBox { Text = Endpoint, ReadOnly = true };
        address.SetBounds(24,96,450,30);
        start.Text="Iniciar servidor";start.SetBounds(24,140,140,36);
        stop.Text="Detener";stop.SetBounds(174,140,105,36);
        panel.Text="Abrir conexión";panel.SetBounds(289,140,185,36);
        Label hint = new Label { Text = "Cerrar esta ventana mantiene el servidor activo." };
        hint.SetBounds(24,190,450,25);
        Controls.AddRange(new Control[]{title,status,address,start,stop,panel,hint});
        start.Click += delegate { StartProvider(); };
        stop.Click += delegate { StopProvider(); };
        panel.Click += delegate { Process.Start(Endpoint); };
        timer.Interval=3000;timer.Tick += delegate { RefreshStatus(); };
        Shown += delegate { RefreshStatus();timer.Start(); };
        FormClosed += delegate { timer.Stop();timer.Dispose(); };
    }

    Dictionary<string,object> Request(string route) {
        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(Endpoint+route);
        request.Timeout=1200;request.ReadWriteTimeout=1200;request.Proxy=null;
        using(WebResponse response=request.GetResponse())
        using(StreamReader reader=new StreamReader(response.GetResponseStream()))
            return json.Deserialize<Dictionary<string,object>>(reader.ReadToEnd());
    }

    Process OwnedProvider() {
        try {
            Dictionary<string,object> record=json.Deserialize<Dictionary<string,object>>(File.ReadAllText(PidFile));
            Process process=Process.GetProcessById(Convert.ToInt32(record["pid"]));
            DateTime started=DateTime.Parse(Convert.ToString(record["startedAt"])).ToUniversalTime();
            if(process.ProcessName!="node" || Math.Abs((process.StartTime.ToUniversalTime()-started).TotalSeconds)>5) return null;
            using(ManagementObjectSearcher search=new ManagementObjectSearcher("SELECT CommandLine FROM Win32_Process WHERE ProcessId="+process.Id))
                foreach(ManagementObject item in search.Get())
                    if(Convert.ToString(item["CommandLine"]).IndexOf(Script,StringComparison.OrdinalIgnoreCase)>=0) return process;
        } catch { }
        return null;
    }

    void RefreshStatus() {
        try {
            Dictionary<string,object> state=Request("/v1/status");
            status.Text=Convert.ToBoolean(state["ready"])?"Conectado. Cuenta de Codex lista.":"Servidor activo. Inicia sesión en Codex.";
            start.Enabled=false;stop.Enabled=OwnedProvider()!=null;panel.Enabled=true;starting=false;
        } catch {
            bool owned=OwnedProvider()!=null;
            status.Text=owned || starting?"Iniciando servidor…":"Servidor detenido.";
            start.Enabled=!owned && !starting;stop.Enabled=false;panel.Enabled=false;
        }
    }

    void StartProvider() {
        try {
            string node=null;
            foreach(string directory in (Environment.GetEnvironmentVariable("PATH") ?? "").Split(Path.PathSeparator)) {
                try { string candidate=Path.Combine(directory.Trim('"'),"node.exe");if(File.Exists(candidate)){node=candidate;break;} } catch { }
            }
            if(node==null) throw new Exception("Instala Node.js antes de iniciar el servidor.");
            Directory.CreateDirectory(Path.Combine(root,"data"));
            Process process=Process.Start(new ProcessStartInfo(node,"\""+Script+"\"") { WorkingDirectory=root,UseShellExecute=false,CreateNoWindow=true });
            File.WriteAllText(PidFile,json.Serialize(new { pid=process.Id,port=54799,startedAt=process.StartTime.ToUniversalTime().ToString("o") }),new UTF8Encoding(false));
            starting=true;start.Enabled=false;status.Text="Iniciando servidor…";
            var deadline=new Timer { Interval=20000 };
            deadline.Tick += delegate { starting=false;deadline.Stop();deadline.Dispose();RefreshStatus(); };
            deadline.Start();
        } catch(Exception error) { MessageBox.Show(error.Message,Text);starting=false;RefreshStatus(); }
    }

    void StopProvider() {
        try {
            Dictionary<string,object> data=Request("/v1/jobs");
            foreach(object value in (System.Collections.IEnumerable)data["jobs"]) {
                var job=(Dictionary<string,object>)value;
                string state=Convert.ToString(job["status"]);
                if(state=="queued" || state=="running" || state=="pausing" || state=="cancelling") {
                    MessageBox.Show("Hay una generación en curso. Pausa o cancela el lote y espera a que termine la imagen antes de detener el servidor.",Text);return;
                }
            }
            Process owned=OwnedProvider();if(owned!=null){owned.Kill();owned.WaitForExit(3000);}RefreshStatus();
        } catch { MessageBox.Show("No se pudo detener el proveedor.",Text); }
    }

    [STAThread]
    static void Main() { Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);Application.Run(new ProviderWindow()); }
}
