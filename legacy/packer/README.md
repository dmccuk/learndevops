## Packer demo (Introduction to packer)

Follow along to create your own AMI image in EC2.

 * **If you use this code, it could cost you some AWS Dollars:**
 
 ## Requirements:

 * Create your own Ubuntu 20.04 VM in AWS. Watch this video (https://youtu.be/XzWyudb4N04)
 * Install awscli and use this to hold you AWS ACCESS & SECRET keys. Watch this video to get your AWS & Secret key (https://youtu.be/1y3IsgvvY84)
 * You'll need to install Packer (https://www.packer.io/downloads.html)
 * This demo was performed using Ubuntu 20.04
 * Install required Linux packages. Watch this video (https://youtu.be/1l545lhadz4)
 * Clone this repo

## Follow these Commands:
Log into your newly create VM.

````
$ cd
$ git clone https://github.com/dmccuk/devops_tool_course.git
Cloning into 'devops_tool_course'...
remote: Enumerating objects: 17, done.
remote: Counting objects: 100% (17/17), done.
remote: Compressing objects: 100% (15/15), done.
remote: Total 17 (delta 4), reused 7 (delta 1), pack-reused 0
Unpacking objects: 100% (17/17), done.
Checking connectivity... done.

Commands:
$ cd devops_tools_course
$ cd packer
$ wget https://releases.hashicorp.com/packer/1.7.10/packer_1.7.10_linux_amd64.zip
$ sudo apt install unzip
$ sudo unzip packer_1.7.10_linux_amd64.zip
$ sudo mv packer /usr/local/bin/
$ echo $PATH
$ packer
Usage: packer [--version] [--help] <command> [<args>]

Available commands are:
    build       build image(s) from template
    console     creates a console for testing variable interpolation
    fix         fixes templates from old versions of packer
    inspect     see components of a template
    validate    check that a template is valid
    version     Prints the Packer version

````

Check the packer file and review the code:

````
packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.2"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "ubuntu" {
  ami_name      = "londonIAC01"
  instance_type = "t2.micro"
  region        = "eu-west-2"
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-focal*20.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]
  }
  ssh_username = "ubuntu"
}

build {
  name = "londonIAC"
  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  provisioner "shell" {
    environment_vars = [
      "FOO=hello world",
    ]
    inline = [
      "echo Installing required packages",
      "sleep 30",
      "sudo apt-get update -yq",
      "sudo DEBIAN_FRONTEND=noninteractive apt upgrade -yq",
      "sudo apt-get install -y wget curl git",
    ]
  }
}

````

## Initiate Packer and validate the file

````
$ packer init .
$ packer fmt .
$ packer validate .

````

## Build your New AMI

Now all we need to do is run the following command:

````
$ packer build aws-ubuntu.pkr.hcl
````

Check the output. At the end you should see something like this:

````
==> Builds finished. The artifacts of successful builds are:
--> londonIAC.amazon-ebs.ubuntu: AMIs were created:
eu-west-2: ami-093762347983f511b
````

Now you can build using this AMI image and it comes with a base set of installed packages. You can see how powerful this is for provisioning and can standardise and speed up VM delivery.

** Repeat this process per AWS region. You cannot use an AMI created in one region, in another. **

That’s it.

Have fun and enjoy.

## How to remove the packer files

After running the above example, your AWS account now has an AMI associated with it. AMIs are stored in S3 by Amazon, so unless you want to be charged about $0.01 per month, you'll probably want to remove it. Remove the AMI by first deregistering it on the AWS AMI management page. Next, delete the associated snapshot on the AWS snapshot management page.

Terminate the image and the snapshot here (Just change the availability zone to the one you built in)
  * https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Images:sort=name
  * https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Snapshots:sort=snapshotId
  
More info here:
https://www.packer.io/intro/getting-started/build-image.html#managing-the-image


Follow us on Linkedin:
https://www.linkedin.com/company/londoniac
