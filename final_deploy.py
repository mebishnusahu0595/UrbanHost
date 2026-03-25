import pexpect
import sys

def deploy():
    password = "UrbanHosts123@"
    host = "72.62.243.77"
    user = "root"
    
    commands = [
        "cd ~/urban-host/urbanhost",
        "git fetch --all",
        "git reset --hard origin/main",
        "npm install",
        "rm -rf .next",
        "npm run build",
        "pm2 restart urbanhost"
    ]
    
    cmd_string = " && ".join(commands)
    ssh_cmd = f'ssh -o StrictHostKeyChecking=no {user}@{host} "{cmd_string}"'
    
    print(f"Executing: {ssh_cmd}")
    child = pexpect.spawn(ssh_cmd, encoding='utf-8', timeout=600)
    child.logfile = sys.stdout
    
    try:
        index = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT])
        if index == 0:
            child.sendline(password)
            child.expect(pexpect.EOF)
        elif index == 1:
            print("EOF reached without password prompt")
        else:
            print("Timeout reached")
    except Exception as e:
        print(f"Error during deployment: {e}")
    finally:
        child.close()

if __name__ == "__main__":
    deploy()
