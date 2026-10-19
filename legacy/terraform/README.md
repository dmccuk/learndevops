## Terraform demo (Introduction to Terraform)

Follow along to create your own AMI image in EC2.

 * **If you use this code, it could cost you some AWS Dollars:**
 
## Requirements:

 * Create your own Ubuntu 20.04 VM in AWS. Watch this video (https://youtu.be/XzWyudb4N04)
 * Install awscli and use this to hold you AWS ACCESS & SECRET keys. Watch this video to get your AWS & Secret key (https://youtu.be/1y3IsgvvY84)
 * You'll need to install Terraform (https://releases.hashicorp.com/packer/1.7.10/packer_1.7.10_linux_amd64.zip)
 * This demo was performed using Ubuntu 20.04
 * Install required Linux packages. Watch this video (https://youtu.be/1l545lhadz4)
 * Clone this repo

## Follow these Commands:
Log into your newly create VM.

````
$ cd
$ git clone https://github.com/dmccuk/devops_tool_course.git # if you've not done this already!
Cloning into 'devops_tool_course'...
remote: Enumerating objects: 17, done.
remote: Counting objects: 100% (17/17), done.
remote: Compressing objects: 100% (15/15), done.
remote: Total 17 (delta 4), reused 7 (delta 1), pack-reused 0
Unpacking objects: 100% (17/17), done.
Checking connectivity... done.

Commands:
$ cd devops_tools_course
$ cd terraform
$ wget https://releases.hashicorp.com/terraform/1.1.9/terraform_1.1.9_linux_amd64.zip
$ sudo apt install unzip
$ sudo unzip terraform_1.1.9_linux_amd64.zip
$ sudo mv terraform /usr/local/bin/
$ echo $PATH
$ terraform
Usage: terraform [global options] <subcommand> [args]

The available commands for execution are listed below.
The primary workflow commands are given first, followed by
less common or more advanced commands.

Main commands:
  init          Prepare your working directory for other commands
````

## Clone the Terraform starter code

````
$ git clone https://github.com/dmccuk/terraform_first.git
Cloning into 'terraform_first'...
remote: Enumerating objects: 120, done.
remote: Counting objects: 100% (9/9), done.
remote: Compressing objects: 100% (7/7), done.
remote: Total 120 (delta 1), reused 6 (delta 1), pack-reused 111
Receiving objects: 100% (120/120), 1.13 MiB | 489.00 KiB/s, done.
Resolving deltas: 100% (24/24), done.

$ cd
$ cd devops_tools_course
$ cd terraform_code/terraform_first
$ cd terraform_first
$ ls -al
total 20
drwxrwxr-x 5 ubuntu ubuntu 4096 May 10 16:30 .
drwxrwxr-x 4 ubuntu ubuntu 4096 May 10 16:30 ..
drwxrwxr-x 2 ubuntu ubuntu 4096 May 10 16:30 first-vm
drwxrwxr-x 2 ubuntu ubuntu 4096 May 10 16:30 nginx
drwxrwxr-x 2 ubuntu ubuntu 4096 May 10 16:30 variables

````
### Step 1 - Create your first instance
Lets check that your AWS credentials are working correctly in Terraform by building just a straight VM from your AMI image you created in the previous lab.

Get your AMI-ID and follow these steps:

1) cd first-vm
This is the most simple terraform file to create an instance (vm) in AWS.

2) vi instance.tf
```
provider "aws" {
  region     = "eu-west-2"
}

resource "aws_instance" "LondonIAC_example_01" {
  ami           = "ADD-YOUR-AMI-ID" #<-- ADD YOUR AMI ID HERE
  instance_type = "t2.micro"
}
```

3) Make sure you change the ami to the one you created with Packer.

Once complete, tun these terraform commands to inistialise and run terraform to create your instance.

```
$ terraform init

Initializing the backend...

Initializing provider plugins...
- Finding latest version of hashicorp/aws...
- Installing hashicorp/aws v4.13.0...
- Installed hashicorp/aws v4.13.0 (signed by HashiCorp)

Terraform has created a lock file .terraform.lock.hcl to record the provider
selections it made above. Include this file in your version control repository
so that Terraform can guarantee to make the same selections by default when
you run "terraform init" in the future.

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
$
$ terraform plan

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with
the following symbols:
  + create

Terraform will perform the following actions:

  # aws_instance.LondonIAC_example_01 will be created
  + resource "aws_instance" "LondonIAC_example_01" {
      + ami                                  = "ami-093762347983f511b"

$ terraform apply
Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

```
Check back in the AWS console and you will see the instance has been created.
This Instance is dumb. You can't log into it because it has no SSH/key available but it proves out AWS connectivity is there and Terraform is able to build in AWS.

Now time to destroy it:
```
Plan: 0 to add, 0 to change, 1 to destroy.

Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure, as shown above.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value: yes

aws_instance.LondonIAC_example_01: Destroying... [id=i-0fa9fc8529f36e2db]
aws_instance.LondonIAC_example_01: Still destroying... [id=i-0fa9fc8529f36e2db, 10s elapsed]
aws_instance.LondonIAC_example_01: Still destroying... [id=i-0fa9fc8529f36e2db, 20s elapsed]
aws_instance.LondonIAC_example_01: Destruction complete after 30s

Destroy complete! Resources: 1 destroyed.
```

### Step 2- Variables in Terraform
In this next section, we use a variables file to control the information we pass to to terraform.

```
$ cd ../variables
$ ls -al
total 20
drwxrwxr-x 2 ubuntu ubuntu 4096 May 10 16:30 .
drwxrwxr-x 5 ubuntu ubuntu 4096 May 10 16:30 ..
-rw-rw-r-- 1 ubuntu ubuntu  110 May 10 16:30 instance.tf
-rw-rw-r-- 1 ubuntu ubuntu   47 May 10 16:30 provider.tf
-rw-rw-r-- 1 ubuntu ubuntu  223 May 10 16:30 vars.tf

$ vi vars.ft
variable "AWS_REGION" {
  default = "eu-west-2"
}
variable "AMIS" {
  type = map(string)
  default = {
    us-east-1 = "ami-13be557ekjksjskjs"
    us-west-2 = "ami-06b94666djdhs9shh"
    eu-west-2 = "ADD-YOUR-AMI-ID" #<--- As before Add in your AMI-ID from packer.
  }
}
```
In the vars.tf file, you can see the first variable is the AWS_REGION. This shows we set "default" to eu-west-2. Next we have have a map variable with three entries for 3 AWS regions. The one we want to update is EU-WEST-2 with the AMI ID from the packer exercise.

add that in and save the file.

Lets quickly check the contents of the other files:
```
$ cat provider.tf
provider "aws" {
    region = var.AWS_REGION
}

$ cat instance.tf
resource "aws_instance" "example" {
  ami           = var.AMIS[var.AWS_REGION]
  instance_type = "t2.micro"
}

```
I'll explain these in the video.

Go ahead and run the same commands as before:

```
$ terraform init
$ terraform plan
$ terraform apply
$ terraform destroy
```
While you run these commands , check in the AWS console and watch your instance getting created. Again, this instance can't so anything. It was a simple example to show you how we can use variables to control what terraform does.


### Step 3 - Create an NGINX webserver and SSH into the instance
In this exercise, were going to do something a bit more interesting. We're going to install and run a webserver on our instance, but also we're going to create some SSH keys and log into the server from our control node.

follow these steps:
```
$ cd ../nginx/
$ ls -al
total 24
drwxrwxr-x 2 ubuntu ubuntu 4096 May 10 16:30 .
drwxrwxr-x 5 ubuntu ubuntu 4096 May 10 16:30 ..
-rw-rw-r-- 1 ubuntu ubuntu  661 May 10 16:30 instance.tf
-rw-rw-r-- 1 ubuntu ubuntu   49 May 10 16:30 provider.tf
-rw-rw-r-- 1 ubuntu ubuntu  224 May 10 16:30 script.sh
-rw-rw-r-- 1 ubuntu ubuntu  396 May 10 16:30 vars.tf

$ vi vars.tf
variable "AWS_REGION" {
  default = "eu-west-2"
}

variable "AMIS" {
  type = map(string)
  default = {
    us-east-1 = "ami-13be557ekjksjskjs"
    us-west-2 = "ami-06b94666djdhs9shh"
    eu-west-2 = "ADD-YOUR-AMI_ID"a <--- ADD YOU AMI ID from packer
  }
}

variable "PATH_TO_PRIVATE_KEY" {
  default = "sshkey"
}

variable "PATH_TO_PUBLIC_KEY" {
  default = "sshkey.pub"
}

variable "INSTANCE_USERNAME" {
  default = "ubuntu"
}

```
The only thing you need to do with this file is add the AMI ID from the packer exercise.

Now lets manually create our SSH key. This key will only exist in your current directory.

```
$ ssh-keygen -f sshkey
Generating public/private rsa key pair.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in sshkey
Your public key has been saved in sshkey.pub
The key fingerprint is:
SHA256:6ExnQ1uQGQMNAA1CEHGdZNhV9nygtd2kQxHScyk41Q4 ubuntu@ip-172-31-8-219
The key's randomart image is:
+---[RSA 3072]----+
|B++O+++=.+++=+.. |
| o..=  .+BP.E++  |
|        o ..     |
|       o o . ..  |
|      o S        |
|     + o .       |
|      o          |
|                 |
|                 |
  +----[SHA256]-----+
```

Now we have our temporary key lets check the other files before we build out server:

```
provider "aws" {
  region     = var.AWS_REGION
}

$ cat instance.tf
resource "aws_key_pair" "mykey" {
  key_name   = "mykey"
  public_key = file(var.PATH_TO_PUBLIC_KEY)
}

resource "aws_instance" "example" {
  ami           = var.AMIS[var.AWS_REGION]
  instance_type = "t2.micro"
  key_name      = aws_key_pair.mykey.key_name

  provisioner "file" {
    source      = "script.sh"
    destination = "/tmp/script.sh"
  }
  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/script.sh",
      "sudo /tmp/script.sh",
    ]
  }
  connection {
    host        = coalesce(self.public_ip, self.private_ip)
    type        = "ssh"
    user        = var.INSTANCE_USERNAME
    private_key = file(var.PATH_TO_PRIVATE_KEY)
  }
}

$ cat script.sh
#!/bin/bash

# sleep until instance is ready
until [[ -f /var/lib/cloud/instance/boot-finished ]]; do
  sleep 1
done

# install nginx
apt-get update
apt-get -y install nginx

# make sure nginx is started
service nginx start
```
As you can see, we're connecting to the remote instance while it's being built, and running a script on it to do an update, then install and start nginx.

Once the build has completed in AWS we're going to (1) login, and (2) see if the webpage is working on our webserver.

Before we do this, lets create a new rule in AWS to allow incoming SSH and HTTP traffic to out instance.
  - Follow the Video for this.

Now lets login:
```
ssh -i sshkey ubuntu@IP_ADDRESS

```
Take a look around

And to check the webpage, visit the IP address of the instance in a web browser.

And that is it for this chapter.

## Destroy your instances
Before you move on, make sure you destroy these instances using either terraform or you can do it manually in AWS. Leaving servers running when you don't need to will only cost you money.

Thanks You!
