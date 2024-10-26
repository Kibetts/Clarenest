const Parent = require('../models/parent.model');
const Student = require('../models/student.model');
const AppError = require('../utils/appError');


exports.registerParent = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { email, name, phone, relationship } = req.body;
  
      // Verify that the student exists and doesn't already have a parent account
      const student = await Student.findById(studentId);
      if (!student) {
        return next(new AppError('Student not found', 404));
      }
  
      if (student.parent) {
        return next(new AppError('Student already has a parent account associated', 400));
      }
  
      // Create parent verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  
      // Create pending parent record
      const parent = await Parent.create({
        name,
        email,
        phone,
        relationship,
        children: [studentId],
        status: 'pending',
        verificationToken: hashedToken,
        verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      });
  
      // Update student with parent reference
      student.parent = parent._id;
      await student.save();
  
      // Send verification email
      const verificationURL = `${process.env.FRONTEND_URL}/parent/verify/${verificationToken}`;
      await sendEmail({
        email: email,
        subject: 'Verify Your Parent Account',
        message: `Please verify your parent account by clicking: ${verificationURL}`
      });
  
      res.status(201).json({
        status: 'success',
        message: 'Parent registration initiated. Please check your email to verify your account.'
      });
    } catch (err) {
      next(new AppError('Error registering parent account: ' + err.message, 500));
    }
  };
  
  exports.verifyParentAccount = async (req, res, next) => {
    try {
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  
      const parent = await Parent.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: Date.now() }
      });
  
      if (!parent) {
        return next(new AppError('Invalid or expired verification token', 400));
      }
  
      // Update parent status
      parent.status = 'active';
      parent.verificationToken = undefined;
      parent.verificationTokenExpires = undefined;
      parent.password = req.body.password;
      await parent.save();
  
      res.status(200).json({
        status: 'success',
        message: 'Parent account verified successfully. You can now log in.'
      });
    } catch (err) {
      next(new AppError('Error verifying parent account: ' + err.message, 500));
    }
  };


exports.getAllParents = async (req, res, next) => {
    const parents = await Parent.find().select('-password');

    res.status(200).json({
        status: 'success',
        results: parents.length,
        data: { parents }
    });
};

exports.createParent = async (req, res, next) => {
    const newParent = await Parent.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { parent: newParent }
    });
};

exports.getParent = async (req, res, next) => {
    const parent = await Parent.findById(req.params.id).select('-password');

    if (!parent) {
        return next(new AppError('No parent found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { parent }
    });
};

exports.updateParent = async (req, res, next) => {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).select('-password');

    if (!parent) {
        return next(new AppError('No parent found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { parent }
    });
};

exports.deleteParent = async (req, res, next) => {
    const parent = await Parent.findByIdAndDelete(req.params.id);

    if (!parent) {
        return next(new AppError('No parent found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
};

exports.getParentChildren = async (req, res, next) => {
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
        return next(new AppError('No parent found with that ID', 404));
    }

    const children = await Student.find({ _id: { $in: parent.children } }).select('-password');

    res.status(200).json({
        status: 'success',
        results: children.length,
        data: { children }
    });
};

exports.getChildAssessments = async (req, res, next) => {
    try {
        const child = await Student.findById(req.params.childId);
        if (!child) {
            return next(new AppError('Child not found', 404));
        }
        // Ensure the child belongs to the parent
        if (child.parent.toString() !== req.user._id.toString()) {
            return next(new AppError('You are not authorized to view this child\'s assessments', 403));
        }
        const assessments = await Assessment.find({
            gradeLevel: child.grade,
            isActive: true
        }).populate('subject');
        res.status(200).json({
            status: 'success',
            data: { assessments }
        });
    } catch (err) {
        next(new AppError('Error fetching child assessments', 500));
    }
};

exports.updateParentFinances = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id);
        if (!parent) {
            return next(new AppError('No parent found with that ID', 404));
        }

        const { amount, description } = req.body;
        parent.updateFinances(amount, description);
        await parent.save();

        res.status(200).json({
            status: 'success',
            data: { parent }
        });
    } catch (err) {
        next(err);
    }
};

exports.getParentFinances = async (req, res, next) => {
    try {
        const parent = await Parent.findById(req.params.id);
        if (!parent) {
            return next(new AppError('No parent found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { finances: parent.finances }
        });
    } catch (err) {
        next(err);
    }
};

exports.createParentAccount = async (req, res, next) => {
    try {
        const application = await Parent.findOne({
            accountCreationToken: crypto.createHash('sha256').update(req.params.token).digest('hex'),
            accountCreationTokenExpires: { $gt: Date.now() }
        });

        if (!application) {
            return next(new AppError('Invalid or expired token', 400));
        }

        const newParent = await Parent.create({
            name: application.name,
            email: application.email,
            password: req.body.password,
            role: 'parent',
            relationship: application.relationship,
            children: application.children,
            status: 'active'
        });

        // Update the application status
        application.status = 'account_created';
        application.accountCreationToken = undefined;
        application.accountCreationTokenExpires = undefined;
        await application.save();

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        newParent.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        newParent.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await newParent.save({ validateBeforeSave: false });

        // Send verification email
        const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking on the following link: ${verificationURL}`;

        await sendEmail({
            email: newParent.email,
            subject: 'Email Verification',
            message
        });

        res.status(201).json({
            status: 'success',
            message: 'Parent account created successfully. Please check your email to verify your account.'
        });
    } catch (err) {
        next(new AppError('Error creating parent account', 500));
    }
};